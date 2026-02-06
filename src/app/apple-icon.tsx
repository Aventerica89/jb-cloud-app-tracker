import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          fill="none"
          width="140"
          height="140"
        >
          <path
            d="M94 72H40c-8.837 0-16-7.163-16-16 0-7.732 5.5-14.176 12.794-15.65C38.5 31.5 46.5 24 56 24c7.348 0 13.715 4.21 16.824 10.348C74.82 32.844 77.77 32 81 32c9.941 0 18 8.059 18 18 0 1.053-.091 2.085-.265 3.088C105.416 55.52 110 61.732 110 69c0 8.837-7.163 16-16 16z"
            fill="#1e3a5f"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <rect x="36" y="48" width="14" height="14" rx="3" fill="#3b82f6" />
          <rect x="57" y="48" width="14" height="14" rx="3" fill="#22c55e" />
          <rect x="78" y="48" width="14" height="14" rx="3" fill="#3b82f6" />
          <rect x="46" y="68" width="14" height="14" rx="3" fill="#f59e0b" />
          <rect x="68" y="68" width="14" height="14" rx="3" fill="#3b82f6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
