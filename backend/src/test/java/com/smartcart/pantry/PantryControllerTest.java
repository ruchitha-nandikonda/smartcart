package com.smartcart.pantry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcart.pantry.dto.CreatePantryItemRequest;
import org.junit.jupiter.api.Test;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract tests for PantryController
 */
@SpringBootTest
@AutoConfigureMockMvc
class PantryControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void testCreatePantryItem() throws Exception {
        CreatePantryItemRequest request = new CreatePantryItemRequest(
            "milk",
            1.0,
            "gallon",
            "",
            "",
            List.of("dairy")
        );
        
        // Note: Requires JWT token - this is a template
        // In real tests, generate valid JWT token
        mockMvc.perform(MockMvcRequestBuilders.post("/api/pantry")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // Without auth token
    }
}

