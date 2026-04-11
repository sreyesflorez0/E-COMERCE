package com.ecommerce.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    UUID userId,
    String fullName,
    String phone,
    LocalDateTime createdAt
) {}
