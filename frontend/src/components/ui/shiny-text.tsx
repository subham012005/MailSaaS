'use client';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`shiny-text inline-block bg-clip-text text-transparent bg-gradient-to-r from-transparent via-white/80 to-transparent bg-[length:200%_100%] ${disabled ? '' : 'animate-shine'
        } ${className}`}
      style={{ animationDuration }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
