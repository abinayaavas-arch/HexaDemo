package com.examly.springapp.controller;

import com.examly.springapp.model.Asset;
import com.examly.springapp.model.AssetStatus;
import com.examly.springapp.model.AssetType;
import com.examly.springapp.repository.AssetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AssetControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Asset testAsset;

    @BeforeEach
    void init() {
        assetRepository.deleteAll();
        testAsset = new Asset();
        testAsset.setName("Dell Latitude 5420");
        testAsset.setType(AssetType.HARDWARE);
        testAsset.setSerialNumber("DL5420-2023-001");
        testAsset.setPurchaseDate(LocalDate.of(2023, 1, 15));
        testAsset.setStatus(AssetStatus.AVAILABLE);
        testAsset.setAssignedTo(null);
        assetRepository.save(testAsset);
    }

    @Test
    void testCreateAssetSuccess() throws Exception {
        Asset asset = new Asset();
        asset.setName("Microsoft Office 365");
        asset.setType(AssetType.SOFTWARE);
        asset.setSerialNumber("MS365-2023-001");
        asset.setPurchaseDate(LocalDate.of(2023, 2, 10));
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setAssignedTo("John Doe");

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Microsoft Office 365"))
                .andExpect(jsonPath("$.serialNumber").value("MS365-2023-001"))
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedTo").value("John Doe"));
    }

    @Test
    void testCreateAssetValidationFailure() throws Exception {
        // Name too short, missing serialNumber
        Asset asset = new Asset();
        asset.setName("PC");
        asset.setType(AssetType.HARDWARE);
        asset.setSerialNumber(null);
        asset.setPurchaseDate(LocalDate.of(2023, 1, 15));
        asset.setStatus(AssetStatus.AVAILABLE);
        
        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.errors.name").value("Name must be 3 to 100 characters long"))
                .andExpect(jsonPath("$.errors.serialNumber").value("Serial number is required"));
    }

    @Test
    void testCreateAssetSerialConflict() throws Exception {
        Asset asset = new Asset();
        asset.setName("Duplicate SN");
        asset.setType(AssetType.HARDWARE);
        asset.setSerialNumber("DL5420-2023-001"); // duplicate
        asset.setPurchaseDate(LocalDate.of(2024, 1, 2));
        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setAssignedTo(null);

        mockMvc.perform(post("/api/assets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Asset with the same serial number")));
    }

    @Test
    void testGetAllAssetsWithFiltering() throws Exception {
        Asset asset2 = new Asset();
        asset2.setName("HP Mouse");
        asset2.setType(AssetType.PERIPHERAL);
        asset2.setSerialNumber("HP2023-001");
        asset2.setPurchaseDate(LocalDate.of(2023, 3, 10));
        asset2.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset2);

        Asset asset3 = new Asset();
        asset3.setName("Office 365 E3");
        asset3.setType(AssetType.SOFTWARE);
        asset3.setSerialNumber("MSO365E3-2023-0001");
        asset3.setPurchaseDate(LocalDate.of(2023, 6, 7));
        asset3.setStatus(AssetStatus.ASSIGNED);
        asset3.setAssignedTo("Jane Smith");
        assetRepository.save(asset3);

        // Test GET ALL
        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        // Filter by type
        mockMvc.perform(get("/api/assets?type=PERIPHERAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("HP Mouse"));

        // Filter by status
        mockMvc.perform(get("/api/assets?status=ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Office 365 E3"));
    }

    @Test
    void testUpdateAssetStatus() throws Exception {
        Long id = testAsset.getId();
        Map<String, Object> payload = Map.of(
                "status", "ASSIGNED",
                "assignedTo", "Jane Smith"
        );
        mockMvc.perform(patch("/api/assets/" + id + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedTo").value("Jane Smith"));
    }

    @Test
    void testUpdateAssetStatusNotFound() throws Exception {
        Map<String, Object> payload = Map.of("status", "AVAILABLE");
        long fakeId = 99999;
        mockMvc.perform(patch("/api/assets/" + fakeId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.message").value("Asset not found"));
    }
}
