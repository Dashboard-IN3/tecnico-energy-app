const Loading = () => {
  return (
    <>
      <div className="animate-pulse w-full h-full p-7 bg-slate-100 shadow-lg relative flex-col justify-start items-end gap-6 inline-flex overflow-hidden"></div>
      <div className="h-full w-full flex justify-center items-center">
        Loading your map...
      </div>
    </>
  )
}

export default Loading
