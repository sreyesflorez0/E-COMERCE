package com.ecommerce.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StatusUpdateRequest {
    @NotNull(message = "El estado (active) es requerido")
    private Boolean active;
}
