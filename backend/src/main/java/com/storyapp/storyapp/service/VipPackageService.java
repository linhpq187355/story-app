package com.storyapp.storyapp.service;

import com.storyapp.storyapp.dto.request.VipPackageRequest;
import com.storyapp.storyapp.dto.response.VipPackageResponse;

import java.util.List;

public interface VipPackageService {

    List<VipPackageResponse> getActivePackages();

    List<VipPackageResponse> getAllPackages();

    VipPackageResponse getPackageById(Long id);

    VipPackageResponse createPackage(VipPackageRequest request);

    VipPackageResponse updatePackage(Long id, VipPackageRequest request);

    VipPackageResponse togglePackageStatus(Long id);

    void deletePackage(Long id);
}
