package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.AdminUserResponse;
import com.ecommerce.auth.dto.RoleUpdateRequest;
import com.ecommerce.auth.dto.StatusUpdateRequest;
import com.ecommerce.auth.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody RoleUpdateRequest request,
            Authentication authentication) {
        String authenticatedUserId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.updateUserRole(id, authenticatedUserId, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        String authenticatedUserId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.updateUserStatus(id, authenticatedUserId, request));
    }
}
