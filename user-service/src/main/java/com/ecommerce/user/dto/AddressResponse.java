package com.ecommerce.user.dto;

import java.util.UUID;

public record AddressResponse(
    UUID id,
    UUID userId,
    String label,
    String street,
    String city,
    String country,
    String postalCode,
    boolean isDefault
) {}
