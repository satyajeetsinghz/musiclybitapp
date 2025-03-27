
interface MusicPageProps {
    handleBack: () => void;
}

const MusicPage: React.FC<MusicPageProps> = ({ handleBack }) => {
    return (
        <div className="w-full h-full absolute inset-0 rounded-md">
            <button onClick={handleBack} className="flex absolute top-[10px] left-[10px] items-center justify-center gap-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-gray-300 size-8">
                <img className="w-[10px]" src="/assets/player ico/left-arrow.svg" alt="" />
            </button>
            <div className="text-2xl max-xs:text-xl h-full text-neutral-200 font-semibold flex justify-center items-center">
                Feature will be avilable soon.
            </div>
        </div>
    )
}

export default MusicPage
