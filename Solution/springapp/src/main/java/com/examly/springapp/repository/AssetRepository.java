package com.examly.springapp.repository;

import com.examly.springapp.model.Asset;
import com.examly.springapp.model.AssetType;
import com.examly.springapp.model.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySerialNumber(String serialNumber);
    List<Asset> findByType(AssetType type);
    List<Asset> findByStatus(AssetStatus status);
    List<Asset> findByTypeAndStatus(AssetType type, AssetStatus status);
}
