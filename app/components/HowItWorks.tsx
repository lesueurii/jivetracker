
export default function HowItWorks() {
    return (
        <>
            <p className="mb-4">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        const modal = document.getElementById('howItWorksModal') as HTMLDialogElement | null;
                        modal?.showModal();
                    }}
                    className="text-blue-500 hover:text-blue-600"
                >
                    &nbsp;How does it work? &rarr;
                </a>
            </p>
            <dialog id="howItWorksModal" className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">How does it work?</h3>
                        <button className="btn btn-sm btn-circle btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="py-2 text-left">
                        1. Connect your Solana wallet<br />
                        2. Link your Spotify account<br />
                        3. Start streaming Jive tracks<br />
                        4. Check the leaderboard to see your rank
                    </p>
                    <p className="py-2 text-left max-w-md">
                        Only the last two hours of your listening activity is recorded. Make sure to revisit this site often to update your stats.
                    </p>
                    <p className="py-2 text-left">
                        <b>
                            Only valid streams are counted, using farms will not count towards this leaderboard.
                        </b>
                    </p>
                </form>
            </dialog>
        </>
    )
};