export interface BuildingsTable {
  building_id: number
  name: string
  type: 'school' | 'canteen' | 'workshop' | 'other'
}