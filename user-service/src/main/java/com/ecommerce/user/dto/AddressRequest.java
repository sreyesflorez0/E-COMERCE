package com.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
                String label,

                @NotBlank(message = "La calle es obligatoria") String street,

                @NotBlank(message = "La ciudad es obligatoria") String city,

                @NotBlank(message = "El país es obligatorio") String country,

                String postalCode,
                Boolean isDefault) {
}
