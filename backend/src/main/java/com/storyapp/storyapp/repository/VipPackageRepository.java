package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.VipPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VipPackageRepository extends JpaRepository<VipPackage, Long> {

    List<VipPackage> findByIsActiveTrueOrderByPriceAsc();

    List<VipPackage> findAllByOrderByCreatedAtDesc();
}
