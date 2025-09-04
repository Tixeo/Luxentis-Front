interface ProjectLogoProps {
  className?: string;
}

export function ProjectLogo({ className }: ProjectLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center">{/*bg-[#F0B90B] mr-3*/}
        {/*<span className="text-black font-bold text-lg">L</span>*/}
        <img src="/images/icon.png" className="w-10 h-10" />
      </div>
      {/*<span className="text-white font-bold text-xl">Luxentis</span>*/}
    </div>
  );
}   