package com.ecommerce.user.service;

import com.ecommerce.user.dto.AddressRequest;
import com.ecommerce.user.dto.AddressResponse;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<AddressResponse> getAddresses(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(UUID userId, AddressRequest request) {
        Address address = Address.builder()
                .userId(userId)
                .label(request.label())
                .street(request.street())
                .city(request.city())
                .country(request.country())
                .postalCode(request.postalCode())
                .isDefault(request.isDefault() != null ? request.isDefault() : false)
                .build();

        address = addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Dirección no encontrada"));

        if (!address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para modificar esta dirección");
        }

        address.setLabel(request.label());
        address.setStreet(request.street());
        address.setCity(request.city());
        address.setCountry(request.country());
        address.setPostalCode(request.postalCode());
        if (request.isDefault() != null) {
            address.setIsDefault(request.isDefault());
        }

        address = addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Dirección no encontrada"));

        if (!address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para eliminar esta dirección");
        }

        addressRepository.delete(address);
    }

    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getUserId(),
                address.getLabel(),
                address.getStreet(),
                address.getCity(),
                address.getCountry(),
                address.getPostalCode(),
                address.getIsDefault()
        );
    }
}
