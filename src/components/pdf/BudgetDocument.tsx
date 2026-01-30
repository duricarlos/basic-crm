import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a', // Blue 900
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  clientInfo: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#f3f4f6', // Gray 100
  },
  label: {
    fontSize: 10,
    color: '#6b7280', // Gray 500
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  value: {
    fontSize: 14,
    marginBottom: 8,
    color: '#000',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb', // Gray 200
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  colDescription: { width: '60%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '25%', textAlign: 'right' },
  
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  }
});

interface BudgetDocumentProps {
  budget: any;
  client: any;
  user: any;
}

export const BudgetDocument = ({ budget, client, user }: BudgetDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>{budget.title || 'PRESUPUESTO'}</Text>
            {budget.header && <Text style={{ fontSize: 10, marginTop: 4, color: '#666' }}>{budget.header}</Text>}
        </View>
        <Text style={{ fontSize: 12 }}>#{budget.id.substring(0, 8).toUpperCase()}</Text>
      </View>

      {/* Info Sections */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ width: '45%' }}>
             <Text style={styles.label}>EMITIDO POR:</Text>
             <Text style={styles.value}>{user.name}</Text>
             <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={{ width: '45%' }}>
             <Text style={styles.label}>CLIENTE:</Text>
             <Text style={styles.value}>{client.name}</Text>
             {client.phone && <Text style={styles.value}>{client.phone}</Text>}
             {client.email && <Text style={styles.value}>{client.email}</Text>}
          </View>
      </View>

      <View style={{ marginBottom: 20 }}>
         <Text style={styles.label}>FECHA DE EMISIÓN:</Text>
         <Text style={styles.value}>
            {budget.dateGenerated ? new Date(budget.dateGenerated).toLocaleDateString() : new Date().toLocaleDateString()}
         </Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>CONCEPTO / SERVICIO</Text>
          <Text style={styles.colQty}>CANT.</Text>
          <Text style={styles.colPrice}>PRECIO</Text>
        </View>
        
        {budget.items.map((item: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDescription}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{parseFloat(item.price).toLocaleString()} $</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
        <Text style={styles.totalValue}>{parseFloat(budget.total).toLocaleString()} $</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
         {budget.footer || 'Gracias por su confianza. Este presupuesto es válido por 15 días.'}
      </Text>

    </Page>
  </Document>
);
