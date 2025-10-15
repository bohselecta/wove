import Image from 'next/image'

export function SectionHero({
  src, 
  title, 
  subtitle
}: { 
  src: string
  title: string
  subtitle?: string 
}) {
  return (
    <div className="relative w-full h-[48vh] min-h-[360px] mb-6 rounded-2xl overflow-hidden border border-white/10">
      <Image 
        src={src} 
        alt={title} 
        fill 
        sizes="100vw" 
        style={{ objectFit: 'cover' }} 
      />
      <div className="absolute bottom-6 left-6">
        <h1 className="text-3xl md:text-4xl font-display drop-shadow">{title}</h1>
        {subtitle && <p className="opacity-85">{subtitle}</p>}
      </div>
    </div>
  )
}
