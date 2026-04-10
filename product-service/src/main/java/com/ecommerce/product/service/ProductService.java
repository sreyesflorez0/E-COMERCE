package com.ecommerce.product.service;

import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(UUID vendorId, CreateProductRequest request) {
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        }

        Product product = Product.builder()
                .vendorId(vendorId)
                .category(category)
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stock(request.stock())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID vendorId, UUID productId, CreateProductRequest request, String role) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!product.getVendorId().equals(vendorId) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("No autorizado para modificar este producto");
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
            product.setCategory(category);
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID vendorId, UUID productId, String role) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!product.getVendorId().equals(vendorId) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("No autorizado para eliminar este producto");
        }

        product.setActive(false);
        productRepository.save(product);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getVendorId(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getActive(),
                product.getCreatedAt()
        );
    }
}
