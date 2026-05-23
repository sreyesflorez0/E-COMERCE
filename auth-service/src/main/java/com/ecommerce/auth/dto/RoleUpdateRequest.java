package com.ecommerce.auth.dto;

import com.ecommerce.auth.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RoleUpdateRequest {
    @NotNull(message = "El rol es requerido")
    private Role role;
}
