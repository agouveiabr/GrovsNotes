/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaptureInput } from './capture-input';
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Mock the hooks and parser
vi.mock('@/hooks/use-items-convex', () => ({
  useCreateItem: () => vi.fn(),
}));

vi.mock('@/sw/offline-queue', () => ({
  addToOfflineQueue: vi.fn(),
  getOfflineQueue: () => [],
  syncOfflineQueue: vi.fn(),
}));

// We'll test if the parser is called correctly
vi.mock('@/convex/lib/parser', () => ({
  parseItem: vi.fn((input) => {
    if (input.startsWith('todo - grov - Fix header')) {
      return {
        type: 'task',
        project: 'grov',
        cleanTitle: 'Fix header',
        dueAt: new Date('2026-03-30T12:00:00Z').getTime()
      };
    }
    return { type: 'idea', cleanTitle: input };
  }),
}));

const mockClient = new ConvexReactClient("http://localhost:4444");

describe('CaptureInput Preview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));
  });

  it('renders preview when valid 4-part structure is typed', async () => {
    render(
      <ConvexProvider client={mockClient}>
        <CaptureInput />
      </ConvexProvider>
    );

    const textarea = screen.getByPlaceholderText(/Type - Project - Title - Date/i);
    
    // Type a structured task
    fireEvent.change(textarea, { target: { value: 'todo - grov - Fix header - tomorrow' } });

    // Check if preview parts are rendered
    expect(screen.getByText('task')).toBeDefined();
    expect(screen.getByText('grov')).toBeDefined();
    expect(screen.getByText('Fix header')).toBeDefined();
    // Mar 30 should be visible for 'tomorrow' if today is Mar 29
    expect(screen.getByText(/Mar 30/i)).toBeDefined();
  });

  it('shows help text when input is empty', () => {
    render(
      <ConvexProvider client={mockClient}>
        <CaptureInput />
      </ConvexProvider>
    );

    expect(screen.getByText(/Use the format/i)).toBeDefined();
  });
});
