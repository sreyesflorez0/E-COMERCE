package com.ecommerce.product.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    String name,
    String description
) {}
