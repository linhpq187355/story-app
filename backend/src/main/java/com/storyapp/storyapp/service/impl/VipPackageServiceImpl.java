package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.request.VipPackageRequest;
import com.storyapp.storyapp.dto.response.VipPackageResponse;
import com.storyapp.storyapp.entity.VipPackage;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.repository.VipPackageRepository;
import com.storyapp.storyapp.service.VipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VipPackageServiceImpl implements VipPackageService {

    private final VipPackageRepository vipPackageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VipPackageResponse> getActivePackages() {
        return vipPackageRepository.findByIsActiveTrueOrderByPriceAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VipPackageResponse> getAllPackages() {
        return vipPackageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VipPackageResponse getPackageById(Long id) {
        VipPackage pkg = vipPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VipPackage", "id", id));
        return toResponse(pkg);
    }

    @Override
    @Transactional
    public VipPackageResponse createPackage(VipPackageRequest request) {
        VipPackage pkg = new VipPackage();
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        VipPackage saved = vipPackageRepository.save(pkg);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public VipPackageResponse updatePackage(Long id, VipPackageRequest request) {
        VipPackage pkg = vipPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VipPackage", "id", id));

        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationDays(request.getDurationDays());
        if (request.getIsActive() != null) {
            pkg.setIsActive(request.getIsActive());
        }

        VipPackage updated = vipPackageRepository.save(pkg);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public VipPackageResponse togglePackageStatus(Long id) {
        VipPackage pkg = vipPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VipPackage", "id", id));

        pkg.setIsActive(!pkg.getIsActive());
        VipPackage updated = vipPackageRepository.save(pkg);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void deletePackage(Long id) {
        VipPackage pkg = vipPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VipPackage", "id", id));
        vipPackageRepository.delete(pkg);
    }

    private VipPackageResponse toResponse(VipPackage pkg) {
        return VipPackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .durationDays(pkg.getDurationDays())
                .isActive(pkg.getIsActive())
                .createdAt(pkg.getCreatedAt())
                .build();
    }
}
