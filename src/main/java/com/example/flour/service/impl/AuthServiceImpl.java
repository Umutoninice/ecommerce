package com.example.flour.service.impl;

import com.example.flour.dto.*;
import com.example.flour.entity.Cart;
import com.example.flour.entity.Role;
import com.example.flour.entity.RoleName;
import com.example.flour.entity.User;
import com.example.flour.exception.BadRequestException;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.CartRepository;
import com.example.flour.repository.RoleRepository;
import com.example.flour.repository.UserRepository;
import com.example.flour.security.JwtTokenProvider;
import com.example.flour.security.UserPrincipal;
import com.example.flour.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
                           CartRepository cartRepository, PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        // Assign Customer role. Bootstrap it if not found in db.
        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_CUSTOMER)));
        user.setRoles(Collections.singleton(customerRole));

        User savedUser = userRepository.save(user);

        // Auto-create a Shopping Cart for the new customer
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        logger.info("Successfully registered user: {} and initialized their cart", savedUser.getEmail());

        List<String> roles = savedUser.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new UserProfileResponse(savedUser.getId(), savedUser.getEmail(), 
                savedUser.getFirstName(), savedUser.getLastName(), savedUser.getPhoneNumber(), roles);
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        logger.info("Successfully logged in user: {}", userPrincipal.getUsername());

        return new JwtResponse(jwt, userPrincipal.getUsername(), roles);
    }

    @Override
    public UserProfileResponse getProfile(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new UserProfileResponse(user.getId(), user.getEmail(), 
                user.getFirstName(), user.getLastName(), user.getPhoneNumber(), roles);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UserPrincipal currentUser, UserProfileUpdateRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        User updatedUser = userRepository.save(user);

        List<String> roles = updatedUser.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        logger.info("Successfully updated profile for user: {}", updatedUser.getEmail());

        return new UserProfileResponse(updatedUser.getId(), updatedUser.getEmail(), 
                updatedUser.getFirstName(), updatedUser.getLastName(), updatedUser.getPhoneNumber(), roles);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiration(LocalDateTime.now().plusHours(1)); // 1 hour expiration
        userRepository.save(user);

        // Simulation of sending an email.
        logger.info("PASSWORD RESET SIMULATION: Sending reset email to {} with token: {}", 
                user.getEmail(), token);
        System.out.println(">>> PASSWORD RESET LINK: http://localhost:8080/api/auth/reset-password?token=" + token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getResetTokenExpiration().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiration(null);
        userRepository.save(user);

        logger.info("Successfully reset password for user: {}", user.getEmail());
    }
}
