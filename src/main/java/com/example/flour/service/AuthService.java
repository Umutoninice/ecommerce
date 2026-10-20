package com.example.flour.service;

import com.example.flour.dto.*;
import com.example.flour.security.UserPrincipal;

public interface AuthService {
    UserProfileResponse register(RegisterRequest request);
    JwtResponse login(LoginRequest request);
    UserProfileResponse getProfile(UserPrincipal currentUser);
    UserProfileResponse updateProfile(UserPrincipal currentUser, UserProfileUpdateRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
