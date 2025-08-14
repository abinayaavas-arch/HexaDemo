package com.examly.springapp.controller;

import com.examly.springapp.model.Asset;
import com.examly.springapp.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;

    @Autowired
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping
    public ResponseEntity<?> createAsset(@Valid @RequestBody Asset asset) {
        try {
            Asset created = assetService.createAsset(asset);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Asset with the same serial number already exists"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(assetService.getAllAssets(type, status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String status = (String) payload.get("status");
        String assignedTo = payload.get("assignedTo") != null ? payload.get("assignedTo").toString() : null;
        try {
            Asset updated = assetService.updateAssetStatus(id, status, assignedTo);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Asset not found".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Asset not found"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
            }
        }
    }
}
