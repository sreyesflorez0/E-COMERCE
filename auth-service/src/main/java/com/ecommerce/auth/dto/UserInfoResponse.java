package com.ecommerce.auth.dto;

import java.util.UUID;

public record UserInfoResponse(
    UUID id,
    String email,
    String role,
    boolean active
) {}
