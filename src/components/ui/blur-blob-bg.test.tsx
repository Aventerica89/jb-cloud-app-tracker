import { render } from '@testing-library/react'
import { BlurBlobBg } from './blur-blob-bg'

describe('BlurBlobBg', () => {
  it('renders container with blob-container class', () => {
    const { container } = render(<BlurBlobBg />)
    const blobContainer = container.querySelector('.blob-container')
    expect(blobContainer).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<BlurBlobBg className="custom-class" />)
    const blobContainer = container.querySelector('.blob-container')
    expect(blobContainer).toHaveClass('custom-class')
  })

  it('renders with default variant styles', () => {
    const { container } = render(<BlurBlobBg />)
    const blobContainer = container.querySelector('.blob-container')
    expect(blobContainer).toHaveStyle({ position: 'absolute' })
  })

  it('renders with subtle variant', () => {
    const { container } = render(<BlurBlobBg variant="subtle" />)
    const blobContainer = container.querySelector('.blob-container')
    expect(blobContainer).toBeInTheDocument()
  })

  it('includes animation keyframes in DOM', () => {
    const { container } = render(<BlurBlobBg />)
    // Check that style tag with keyframes exists
    const styleTag = container.querySelector('style')
    expect(styleTag).toBeInTheDocument()
    expect(styleTag?.textContent).toContain('keyframes')
  })

  it('renders pseudo-elements via CSS (structure test)', () => {
    const { container } = render(<BlurBlobBg />)
    const blobContainer = container.querySelector('.blob-container')

    // We can't directly test pseudo-elements, but we can verify
    // the container exists and has the right structure
    expect(blobContainer).toBeInTheDocument()

    // Verify CSS is applied by checking computed styles
    const computedStyle = window.getComputedStyle(blobContainer as Element)
    expect(computedStyle.position).toBe('absolute')
    expect(computedStyle.overflow).toBe('hidden')
  })
})
