package com.ecommerce.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    UUID vendorId,
    UUID categoryId,
    String categoryName,
    String name,
    String description,
    BigDecimal price,
    int stock,
    boolean active,
    LocalDateTime createdAt
) {}
