'use client'

interface BlurBlobBgProps {
  variant?: 'default' | 'subtle'
  className?: string
}

export function BlurBlobBg({ variant = 'default', className = '' }: BlurBlobBgProps) {
  const isSubtle = variant === 'subtle'

  return (
    <>
      <style jsx>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .blob-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .blob-container::before,
        .blob-container::after {
          content: '';
          position: absolute;
          width: ${isSubtle ? '300px' : '600px'};
          height: ${isSubtle ? '300px' : '600px'};
          border-radius: 50%;
          filter: blur(${isSubtle ? '60px' : '80px'});
        }

        .blob-container::before {
          background: linear-gradient(
            180deg,
            ${isSubtle ? 'rgba(255, 87, 34, 0.3)' : 'rgba(255, 87, 34, 0.6)'} 0%,
            ${isSubtle ? 'rgba(251, 140, 0, 0.3)' : 'rgba(251, 140, 0, 0.6)'} 100%
          );
          top: ${isSubtle ? '10%' : '-10%'};
          right: ${isSubtle ? '10%' : '-10%'};
          animation: rotate ${isSubtle ? '15s' : '10s'} infinite linear;
        }

        .blob-container::after {
          background: linear-gradient(
            180deg,
            ${isSubtle ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.6)'} 0%,
            ${isSubtle ? 'rgba(255, 183, 77, 0.3)' : 'rgba(255, 183, 77, 0.6)'} 100%
          );
          bottom: ${isSubtle ? '10%' : '-10%'};
          left: ${isSubtle ? '10%' : '-10%'};
          animation: rotate ${isSubtle ? '20s' : '15s'} infinite linear reverse;
        }
      `}</style>
      <div className={`blob-container ${className}`} />
    </>
  )
}
