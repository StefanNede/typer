export default function EndOfTest({showEndScreen, setShowEndScreen, wpm, accuracy, testMode, testLength, char, correctChars, timeTaken}) {
    function resetTest() {
        setShowEndScreen(false)
        location.reload()
    }
    return (
        <div>
            <div className="flex flex-col bg-green-">
                <div className="h-[25vh] flex flex-row items-center justify-around">
                    {/* wpm and accuracy */}
                    <div className = "">
                        <h3 className="font-bold text-2xl mb-2 text-blue-400">wpm</h3>
                        <p className="text-6xl text-red-400">{Math.round(wpm)}</p>
                    </div>
                    <div className = "">
                        <h3 className="font-bold text-2xl mb-2 text-blue-400">acc</h3>
                        <p className="text-6xl text-red-400">{Math.round(accuracy)}%</p>
                    </div>
                </div>
                <div className="h-[20vh] mt-[10vh]  flex flex-row items-center justify-around">
                    {/* test type, characters, time */}
                    <div className = "">
                        <h3 className="font-bold text-2xl mb-2 text-blue-400">test type</h3>
                        {testMode === "quote" ?
                            <p className="text-3xl text-red-400">{testMode}</p>
                            :
                            <p className="text-3xl text-red-400">{testMode} {testLength}</p>
                        }
                    </div>
                    <div className = "">
                        <h3 className="font-bold text-2xl mb-2 text-blue-400">characters</h3>
                        <p className="text-3xl text-red-400">{correctChars}/{char-correctChars}</p>
                    </div>
                    <div className = "">
                        <h3 className="font-bold text-2xl mb-2 text-blue-400">time</h3>
                        <p className="text-3xl text-red-400">{Math.round(timeTaken/1000)}s</p>
                    </div>
                </div>
                <div className="mt-[5vh] flex items-center justify-center">
                    {/* redo button */}
                    <button className="text-white text-5xl" onClick={() => resetTest()}>⟳</button>
                </div>
            </div>
        </div>
    )
}

