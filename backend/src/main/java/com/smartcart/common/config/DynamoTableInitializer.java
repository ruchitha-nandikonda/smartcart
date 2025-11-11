package com.smartcart.common.config;

import com.smartcart.auth.model.User;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

@Component
public class DynamoTableInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(DynamoTableInitializer.class);
    
    @Autowired
    private DynamoDbClient dynamoDbClient;
    
    @Autowired
    private DynamoDbEnhancedClient enhancedClient;
    
    @Value("${aws.access-key-id:}")
    private String configuredAccessKey;
    
    @Value("${aws.secret-access-key:}")
    private String configuredSecretKey;
    
    @Value("${aws.dynamo.endpoint:}")
    private String dynamoEndpoint;
    
    @PostConstruct
    public void initTables() {
        if (shouldSkipInitialization()) {
            logger.warn("Skipping DynamoDB table initialization: no AWS credentials found and no local DynamoDB endpoint configured.");
            return;
        }
        
        initTable("Users", "userId");
        initPantryItemsTable();
        initReceiptsTable();
        initShoppingListsTable();
        initMealFavoritesTable();
        initDealsTable();
        initOTPTable();
    }
    
    private boolean shouldSkipInitialization() {
        boolean hasEndpoint = StringUtils.hasText(dynamoEndpoint);
        if (hasEndpoint) {
            return false;
        }
        
        boolean hasConfiguredKeys = StringUtils.hasText(configuredAccessKey) && StringUtils.hasText(configuredSecretKey);
        if (hasConfiguredKeys) {
            return false;
        }
        
        String envAccessKey = System.getenv("AWS_ACCESS_KEY_ID");
        String envSecretKey = System.getenv("AWS_SECRET_ACCESS_KEY");
        boolean hasEnvKeys = StringUtils.hasText(envAccessKey) && StringUtils.hasText(envSecretKey);
        return !hasEnvKeys;
    }
    
    private void initPantryItemsTable() {
        try {
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName("PantryItems")
                        .build());
                logger.info("Table 'PantryItems' already exists");
            } catch (ResourceNotFoundException e) {
                logger.info("Creating table 'PantryItems'...");
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("PantryItems")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("userId")
                                        .keyType(KeyType.HASH)
                                        .build(),
                                KeySchemaElement.builder()
                                        .attributeName("sortKey")
                                        .keyType(KeyType.RANGE)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("userId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("sortKey")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table 'PantryItems' created successfully");
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing PantryItems table: {}", e.getMessage(), e);
        }
    }
    
    private void initMealFavoritesTable() {
        try {
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName("MealFavorites")
                        .build());
                logger.info("Table 'MealFavorites' already exists");
            } catch (ResourceNotFoundException e) {
                logger.info("Creating table 'MealFavorites'...");
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("MealFavorites")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("userId")
                                        .keyType(KeyType.HASH)
                                        .build(),
                                KeySchemaElement.builder()
                                        .attributeName("favoriteId")
                                        .keyType(KeyType.RANGE)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("userId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("favoriteId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table 'MealFavorites' created successfully");
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing MealFavorites table: {}", e.getMessage(), e);
        }
    }
    
    private void initShoppingListsTable() {
        try {
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName("ShoppingLists")
                        .build());
                logger.info("Table 'ShoppingLists' already exists");
            } catch (ResourceNotFoundException e) {
                logger.info("Creating table 'ShoppingLists'...");
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("ShoppingLists")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("userId")
                                        .keyType(KeyType.HASH)
                                        .build(),
                                KeySchemaElement.builder()
                                        .attributeName("listId")
                                        .keyType(KeyType.RANGE)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("userId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("listId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table 'ShoppingLists' created successfully");
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing ShoppingLists table: {}", e.getMessage(), e);
        }
    }
    
    private void initReceiptsTable() {
        try {
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName("Receipts")
                        .build());
                logger.info("Table 'Receipts' already exists");
            } catch (ResourceNotFoundException e) {
                logger.info("Creating table 'Receipts'...");
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("Receipts")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("userId")
                                        .keyType(KeyType.HASH)
                                        .build(),
                                KeySchemaElement.builder()
                                        .attributeName("receiptId")
                                        .keyType(KeyType.RANGE)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("userId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("receiptId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table 'Receipts' created successfully");
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing Receipts table: {}", e.getMessage(), e);
        }
    }
    
    private void initTable(String tableName, String partitionKey) {
        try {
            // Check if table exists
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName(tableName)
                        .build());
                logger.info("Table '{}' already exists", tableName);
            } catch (ResourceNotFoundException e) {
                // Table doesn't exist, create it
                logger.info("Creating table '{}'...", tableName);
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName(tableName)
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName(partitionKey)
                                        .keyType(KeyType.HASH)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName(partitionKey)
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table '{}' created successfully", tableName);
                
                // Wait for table to be active (with timeout for local DynamoDB)
                try {
                    dynamoDbClient.waiter().waitUntilTableExists(DescribeTableRequest.builder()
                            .tableName(tableName)
                            .build());
                } catch (Exception waiterException) {
                    // For local DynamoDB, waiter might not work, so just log
                    logger.warn("Could not wait for table to be active: {}", waiterException.getMessage());
                    // Give it a short delay
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing DynamoDB table '{}': {}", tableName, e.getMessage(), e);
            // Don't fail startup if table creation fails (might already exist)
        }
    }
    
    private void initOTPTable() {
        try {
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName("OTPs")
                        .build());
                logger.info("Table 'OTPs' already exists");
            } catch (ResourceNotFoundException e) {
                logger.info("Creating table 'OTPs'...");
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("OTPs")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("email")
                                        .keyType(KeyType.HASH)
                                        .build(),
                                KeySchemaElement.builder()
                                        .attributeName("type")
                                        .keyType(KeyType.RANGE)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("email")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("type")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table 'OTPs' created successfully");
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing OTPs table: {}", e.getMessage(), e);
        }
    }
    
    private void initDealsTable() {
        try {
            try {
                dynamoDbClient.describeTable(DescribeTableRequest.builder()
                        .tableName("Deals")
                        .build());
                logger.info("Table 'Deals' already exists");
            } catch (ResourceNotFoundException e) {
                logger.info("Creating table 'Deals'...");
                
                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("Deals")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("storeIdDate")
                                        .keyType(KeyType.HASH)
                                        .build(),
                                KeySchemaElement.builder()
                                        .attributeName("productId")
                                        .keyType(KeyType.RANGE)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("storeIdDate")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("productId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .billingMode(BillingMode.PAY_PER_REQUEST)
                        .build();
                
                dynamoDbClient.createTable(createTableRequest);
                logger.info("Table 'Deals' created successfully");
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing Deals table: {}", e.getMessage(), e);
        }
    }
}

