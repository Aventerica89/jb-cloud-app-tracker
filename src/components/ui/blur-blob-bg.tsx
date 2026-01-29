'use client'

interface BlurBlobBgProps {
  variant?: 'default' | 'subtle'
  className?: string
}

export function BlurBlobBg({ variant = 'default', className = '' }: BlurBlobBgProps) {
  return (
    <>
      <style jsx global>{`
        @keyframes hue-shift {
          0% { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
          25% { backdrop-filter: blur(3em) brightness(9) hue-rotate(-25deg); }
          28% { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
          32% { backdrop-filter: blur(3em) brightness(9) hue-rotate(-20deg); }
          39% { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
          40% { backdrop-filter: blur(3em) brightness(9) hue-rotate(-20deg); }
          41% { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
          42% { backdrop-filter: blur(3em) brightness(9) hue-rotate(-25deg); }
          44% { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
          58% { backdrop-filter: blur(3em) brightness(9) hue-rotate(-20deg); }
          64% { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
          80% { backdrop-filter: blur(3em) brightness(9) hue-rotate(-25deg); }
          to { backdrop-filter: blur(3em) brightness(9) hue-rotate(0deg); }
        }

        @keyframes wave-rain {
          0% {
            background-position: 0px 220px, 3px 220px, 151.5px 337.5px, 25px 24px, 28px 24px, 176.5px 150px;
          }
          to {
            background-position: 0px 6800px, 3px 6800px, 151.5px 6917.5px, 25px 13632px, 28px 13632px, 176.5px 13758px;
          }
        }
      `}</style>

      <div
        className={className}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#1a1a1a',
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Wave/rain lines */}
        <div
          style={{
            content: '""',
            position: 'absolute',
            inset: '-145%',
            rotate: '-45deg',
            backgroundImage: `
              radial-gradient(4px 100px at 0px 235px, #fa0, #0000),
              radial-gradient(4px 100px at 300px 235px, #fa0, #0000),
              radial-gradient(3px 4px at 150px 117.5px, #f00 100%, #0000 150%),
              radial-gradient(4px 100px at 0px 252px, #fa0, #0000),
              radial-gradient(4px 100px at 300px 252px, #fa0, #0000),
              radial-gradient(3px 4px at 150px 126px, #f00 100%, #0000 150%)
            `,
            backgroundSize: '300px 235px, 300px 235px, 300px 235px, 300px 252px, 300px 252px, 300px 252px',
            animation: 'wave-rain 150s linear infinite',
          }}
        />

        {/* Dotted grid overlay with dark background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'rgba(0, 0, 0, 0.7)',
            backgroundImage: 'radial-gradient(circle, rgba(251, 140, 0, 0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backdropFilter: 'blur(2em)',
          }}
        />
      </div>
    </>
  )
}
