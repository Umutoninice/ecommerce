package com.example.flour.service.impl;

import com.example.flour.dto.CategoryDto;
import com.example.flour.entity.Category;
import com.example.flour.exception.BadRequestException;
import com.example.flour.exception.ResourceNotFoundException;
import com.example.flour.repository.CategoryRepository;
import com.example.flour.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        if (categoryRepository.findByName(categoryDto.getName()).isPresent()) {
            throw new BadRequestException("Category with name '" + categoryDto.getName() + "' already exists");
        }
        Category category = new Category(categoryDto.getName(), categoryDto.getDescription());
        Category saved = categoryRepository.save(category);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        categoryRepository.findByName(categoryDto.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Category with name '" + categoryDto.getName() + "' already exists");
            }
        });

        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        Category updated = categoryRepository.save(category);
        return convertToDto(updated);
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return convertToDto(category);
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryDto convertToDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getDescription());
    }
}
