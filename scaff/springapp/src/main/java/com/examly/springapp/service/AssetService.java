package com.examly.springapp.service;

import com.examly.springapp.model.Asset;
import com.examly.springapp.model.AssetType;
import com.examly.springapp.model.AssetStatus;
import com.examly.springapp.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AssetService {
    private final AssetRepository assetRepository;

    @Autowired
    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    public Asset createAsset(Asset asset) {
        // Check uniqueness for serial number
        if (assetRepository.findBySerialNumber(asset.getSerialNumber()).isPresent()) {
            throw new DataIntegrityViolationException("Asset with the same serial number already exists");
        }
        // Save asset
        return assetRepository.save(asset);
    }

    public List<Asset> getAllAssets(String type, String status) {
        if (type != null && status != null) {
            AssetType assetType = AssetType.valueOf(type);
            AssetStatus assetStatus = AssetStatus.valueOf(status);
            return assetRepository.findByTypeAndStatus(assetType, assetStatus);
        } else if (type != null) {
            AssetType assetType = AssetType.valueOf(type);
            return assetRepository.findByType(assetType);
        } else if (status != null) {
            AssetStatus assetStatus = AssetStatus.valueOf(status);
            return assetRepository.findByStatus(assetStatus);
        } else {
            return assetRepository.findAll();
        }
    }

    @Transactional
    public Asset updateAssetStatus(Long id, String status, String assignedTo) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        AssetStatus updatedStatus;
        try {
            updatedStatus = AssetStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid asset status");
        }
        asset.setStatus(updatedStatus);
        if (updatedStatus == AssetStatus.ASSIGNED) {
            asset.setAssignedTo(assignedTo);
        } else {
            asset.setAssignedTo(null);
        }
        return assetRepository.save(asset);
    }
}
