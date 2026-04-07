/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaptureInput } from './capture-input';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const mockCreateItem = vi.fn(async (_payload: Record<string, unknown>) => 'new-item-id');
const mockCreateProject = vi.fn(async () => 'new-project-id');

// Mock hooks
vi.mock('@/hooks/use-items-convex', () => ({
  useCreateItem: () => mockCreateItem,
}));

vi.mock('@/hooks/use-projects-convex', () => ({
  useProjects: () => [
    { id: 'p1', _id: 'p1', name: 'Grovs', alias: 'grov' },
    { id: 'p2', _id: 'p2', name: 'Personal', alias: 'pers' },
  ],
  useCreateProject: () => mockCreateProject,
}));

vi.mock('@/sw/offline-queue', () => ({
  addToOfflineQueue: vi.fn(),
  getOfflineQueue: () => [],
  syncOfflineQueue: vi.fn(),
}));

const mockClient = new ConvexReactClient("http://localhost:4444");

describe('CaptureInput Preview', () => {
  beforeEach(() => {
    mockCreateItem.mockClear();
    mockCreateProject.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'));
  });

  it('renders preview for structured field input', async () => {
    render(
      <ConvexProvider client={mockClient}>
        <CaptureInput />
      </ConvexProvider>
    );

    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'task' } });
    fireEvent.change(screen.getByLabelText('Project'), { target: { value: 'Grovs' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Fix header' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Body content here' } });

    expect(screen.getByText('task')).toBeDefined();
    expect(screen.getByText('Grovs')).toBeDefined();
    expect(screen.getByText('Fix header')).toBeDefined();
    expect(screen.getByText('Body content here')).toBeDefined();
  });

  it('sends content in create payload', async () => {
    render(
      <ConvexProvider client={mockClient}>
        <CaptureInput />
      </ConvexProvider>
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Fix header' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Detailed note body' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockCreateItem).toHaveBeenCalled();
    const lastCall = mockCreateItem.mock.calls[mockCreateItem.mock.calls.length - 1];
    const payload = (lastCall?.[0] ?? {}) as { title?: string; content?: string };
    expect(payload.title).toBe('Fix header');
    expect(payload.content).toBe('Detailed note body');
  });

  it('creates a new project option when project does not exist', async () => {
    render(
      <ConvexProvider client={mockClient}>
        <CaptureInput />
      </ConvexProvider>
    );

    fireEvent.change(screen.getByLabelText('Project'), { target: { value: 'New Space' } });
    fireEvent.keyDown(screen.getByLabelText('Project'), { key: 'Tab' });

    expect(mockCreateProject).toHaveBeenCalledWith({ name: 'New Space' });
  });

  it('shows help text when input is empty', () => {
    render(
      <ConvexProvider client={mockClient}>
        <CaptureInput />
      </ConvexProvider>
    );

    expect(screen.getByText(/Press/i)).toBeDefined();
  });
});
