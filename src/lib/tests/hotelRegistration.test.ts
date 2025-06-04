// import { describe, it, expect, vi } from 'vitest';
// import { supabaseAdmin } from '$lib/supabaseAdminClient';
// import type { RequestEvent } from '@sveltejs/kit';
// import { actions } from '../../../src/routes/register/hotel/+page.server';
// import { HOTEL_PRICES } from '../components/constants';

// vi.mock('$lib/supabaseAdminClient', () => ({
//   supabaseAdmin: {
//     from: vi.fn(() => ({
//       select: vi.fn(() => ({
//         data: [],
//         error: null
//       })),
//       insert: vi.fn(() => ({
//         data: [],
//         error: null
//       }))
//     }))
//   }
// }));

// describe('Hotel Registration System', () => {
//   describe('Room Availability Check', () => {
//     it('should check total room availability', async () => {
//       // Mock the Supabase query for room count
//       const mockHotelRegistrations = Array(8).fill({ hoteloption: 'HotelOptionOne' });
//       supabaseAdmin.from().select.mockResolvedValueOnce({
//         data: mockHotelRegistrations,
//         error: null
//       });

//       // Create a mock request
//       const mockRequestEvent = {
//         request: new Request('http://localhost'),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       // Should succeed as total rooms (8) is less than limit (10)
//       expect(result).toBeTruthy();
//     });

//     it('should check triple/quatro room availability', async () => {
//       // Mock reaching the large room limit
//       const mockHotelRegistrations = Array(70).fill({ 
//         hoteloption: Array(35).fill('HotelOptionThree').concat(Array(35).fill('HotelOptionFour')) 
//       });
      
//       supabaseAdmin.from().select.mockResolvedValueOnce({
//         data: mockHotelRegistrations,
//         error: null
//       });

//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionThree');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionThree));
//       formData.append('Roommate1', 'Test Roommate 1');
//       formData.append('Roommate2', 'Test Roommate 2');

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       // Should fail as large rooms (70) has reached limit
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toContain('all triple and quadro rooms are currently booked');
//     });
//   });

//   describe('Room Validation', () => {
//     it('should validate twin room requires one roommate', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionTwo');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionTwo));
//       // Missing roommate information

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toContain('requires one roommate name');
//     });

//     it('should validate triple room requires two roommates', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionThree');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionThree));
//       formData.append('Roommate1', 'Test Roommate 1');
//       // Missing second roommate

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toContain('requires two roommate names');
//     });

//     it('should validate quatro room requires three roommates', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionFour');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionFour));
//       formData.append('Roommate1', 'Test Roommate 1');
//       formData.append('Roommate2', 'Test Roommate 2');
//       // Missing third roommate

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toContain('requires three roommate names');
//     });
//   });

//   describe('Price Calculation', () => {
//     it('should calculate correct price for single room', async () => {
//       const nights = 2;
//       const expectedPrice = HOTEL_PRICES.HotelOptionOne * nights;
      
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionOne');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-04');
//       formData.append('NumberOfNights', String(nights));
//       formData.append('CalculatedHotelPrice', String(expectedPrice));

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       supabaseAdmin.from().insert.mockResolvedValueOnce({
//         data: [{ amountdue: expectedPrice }],
//         error: null
//       });

//       const result = await actions.bookHotel(mockRequestEvent);
//       expect(result?.type).not.toBe('fail');
//     });

//     // Add more price calculation tests for other room types
//   });

//   describe('Form Validation', () => {
//     it('should validate required fields', async () => {
//       const formData = new FormData();
//       // Missing required fields

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toContain('Missing required field');
//     });

//     it('should validate email format', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionOne');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'invalid-email');  // Invalid email format
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionOne));

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.field).toBe('email');
//     });

//     it('should validate check-in date is before check-out date', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionOne');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-04');  // Check-in after check-out
//       formData.append('CheckOutDate', '2025-10-02');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionOne));

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       const result = await actions.bookHotel(mockRequestEvent);
      
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toContain('Check-in date must be before check-out date');
//     });
//   });

//   describe('Database Operations', () => {
//     it('should handle successful hotel registration', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionOne');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionOne));

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       supabaseAdmin.from().insert.mockResolvedValueOnce({
//         data: [{ id: 1 }],
//         error: null
//       });

//       const result = await actions.bookHotel(mockRequestEvent);
//       expect(result?.type).not.toBe('fail');
//     });

//     it('should handle database errors gracefully', async () => {
//       const formData = new FormData();
//       formData.append('HotelOption', 'HotelOptionOne');
//       formData.append('FullName', 'Test User');
//       formData.append('Email', 'test@example.com');
//       formData.append('CheckInDate', '2025-10-02');
//       formData.append('CheckOutDate', '2025-10-03');
//       formData.append('NumberOfNights', '1');
//       formData.append('CalculatedHotelPrice', String(HOTEL_PRICES.HotelOptionOne));

//       const mockRequestEvent = {
//         request: new Request('http://localhost', {
//           method: 'POST',
//           body: formData
//         }),
//         url: new URL('http://localhost')
//       } as RequestEvent;

//       supabaseAdmin.from().insert.mockResolvedValueOnce({
//         data: null,
//         error: { message: 'Database error' }
//       });

//       const result = await actions.bookHotel(mockRequestEvent);
//       expect(result?.type).toBe('fail');
//       expect(result?.data?.error).toBeTruthy();
//     });
//   });
// });
