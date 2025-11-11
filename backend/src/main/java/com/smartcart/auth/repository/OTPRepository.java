package com.smartcart.auth.repository;

import com.smartcart.auth.model.OTP;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class OTPRepository {
    
    private final DynamoDbTable<OTP> otpTable;
    private static final String TABLE_NAME = "OTPs";
    
    @Autowired
    public OTPRepository(DynamoDbEnhancedClient enhancedClient) {
        this.otpTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(OTP.class));
    }
    
    public void save(OTP otp) {
        otpTable.putItem(otp);
    }
    
    public OTP findByEmailAndType(String email, String type) {
        Key key = Key.builder()
                .partitionValue(email)
                .sortValue(type)
                .build();
        return otpTable.getItem(key);
    }
    
    public void delete(String email, String type) {
        Key key = Key.builder()
                .partitionValue(email)
                .sortValue(type)
                .build();
        otpTable.deleteItem(key);
    }
    
    public void deleteAllByEmail(String email) {
        // OTPs are keyed by email+type, so we need to delete known types
        // Common types: REGISTRATION, PASSWORD_RESET
        String[] types = {"REGISTRATION", "PASSWORD_RESET"};
        for (String type : types) {
            try {
                delete(email, type);
            } catch (Exception e) {
                // Ignore if OTP doesn't exist
            }
        }
    }
}

