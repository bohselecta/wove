type Props = {
  title: string
  subtitle?: string
  image: string
}

export default function SectionHeader({ title, subtitle, image }: Props) {
  return (
    <header className="relative h-auto min-h-[200px] overflow-hidden flex flex-col justify-end">
      {/* Background Image */}
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      
      {/* Content overlay */}
      <div className="relative z-10 p-6">
        <h1 className="text-3xl font-display text-white drop-shadow-lg">{title}</h1>
        {subtitle && (
          <p className="text-white/80 mt-2 text-lg">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
