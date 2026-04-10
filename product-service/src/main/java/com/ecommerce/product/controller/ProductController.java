package com.ecommerce.product.controller;

import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            Authentication authentication,
            @Valid @RequestBody CreateProductRequest request) {
        UUID vendorId = UUID.fromString((String) authentication.getPrincipal());
        ProductResponse product = productService.createProduct(vendorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody CreateProductRequest request) {
        UUID vendorId = UUID.fromString((String) authentication.getPrincipal());
        @SuppressWarnings("unchecked")
        Map<String, String> details = (Map<String, String>) authentication.getDetails();
        String role = details.get("role");
        ProductResponse product = productService.updateProduct(vendorId, id, request, role);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID vendorId = UUID.fromString((String) authentication.getPrincipal());
        @SuppressWarnings("unchecked")
        Map<String, String> details = (Map<String, String>) authentication.getDetails();
        String role = details.get("role");
        productService.deleteProduct(vendorId, id, role);
        return ResponseEntity.noContent().build();
    }
}
