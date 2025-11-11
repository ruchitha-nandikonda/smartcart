describe('Receipt Upload Flow', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.contains('button', 'Login').click()
    cy.url().should('include', '/pantry')
  })

  it('should upload receipt and update pantry', () => {
    cy.visit('/receipts')
    
    // Upload file
    cy.get('input[type="file"]').attachFile('test-receipt.jpg')
    
    // Wait for processing
    cy.contains('Processing', { timeout: 10000 })
    
    // Verify receipt appears in list
    cy.contains('processed', { timeout: 15000 })
    
    // Check pantry updated
    cy.visit('/pantry')
    cy.contains('Milk').should('exist')
  })
})









