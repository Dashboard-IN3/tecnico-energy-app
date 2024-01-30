import Image from "next/image"
import chevron from "../../../../public/icons/chevron-left.svg"

const StudyDetails: React.FC = () => {
  return (
    <>
      <div className="text-2xl font-light flex ml-10 mt-8 grid-col-1 ">
        <div className="mr-6 hover:bg-slate-100 h-[32px] min-w-[32px] p-1 rounded cursor-pointer">
          <Image src={chevron} alt="trash logo" width={24} height={24} />
        </div>
        <div className="min-w-[70vw] md:min-w-full">About This Study</div>
      </div>
      <div className="pl-6 md:pl-0 pr-6 pt-6 pb-6 mt-24 md:mt-48 max-w-[100%]">
        <div className="text-lg font-black my-4">Overview</div>
        <div>
          Aliquip labore incididunt deserunt nisi dolor mollit amet est
          reprehenderit sint incididunt. Incididunt Lorem commodo consectetur
          qui reprehenderit officia sit nulla officia elit voluptate do ullamco.
          Voluptate anim laboris quis sint. Minim commodo cupidatat aute id
          veniam pariatur aliqua et reprehenderit. Cupidatat exercitation qui
          nostrud ex. Occaecat labore incididunt velit culpa reprehenderit aute
          velit ullamco amet voluptate nostrud pariatur elit. Ea deserunt
          consectetur nostrud duis occaecat anim ad quis sunt. Dolore sint
          reprehenderit minim ut cillum sit. Enim cupidatat in tempor fugiat est
          ut esse aliqua sunt.
        </div>
        <div className="text-lg font-black my-4">Details</div>
        <div>
          Pariatur sunt fugiat do do anim ea quis in. Sit excepteur amet nulla
          tempor amet est sit elit cillum minim exercitation ex. Laborum id
          officia sunt reprehenderit id id ex consectetur consequat culpa.
          Nostrud ea commodo fugiat minim in Lorem. Lorem aliqua aute fugiat ea.
          Aliqua proident ex in incididunt cupidatat mollit quis excepteur non
          nostrud sunt sunt ex laborum. Officia occaecat cupidatat pariatur do
          velit reprehenderit. Id ut proident nisi occaecat laborum sunt duis
          consectetur voluptate dolor. Voluptate enim reprehenderit ullamco
          proident laboris. Deserunt magna culpa anim proident culpa id irure.
          Et laborum reprehenderit velit amet non do ad. Proident laboris
          proident laboris enim velit occaecat laboris ad tempor eiusmod
          pariatur fugiat. Eiusmod duis veniam consequat dolore culpa enim sint
          dolor id officia eu dolor.
        </div>
        <div className="text-lg font-black my-4">Refereences and citations</div>
        <div>
          Officia qui sit laborum proident sunt eu dolore tempor exercitation
          ullamco id pariatur eu ea. Aute dolore pariatur quis aliqua ea ex
          cillum. Laboris in irure minim non cupidatat est velit adipisicing
          mollit tempor. Officia fugiat amet aliquip eiusmod deserunt cupidatat
          duis do nulla aute cupidatat sit labore. Exercitation aute duis
          excepteur sit excepteur et Lorem esse sit sint nulla. Eu elit culpa
          non officia magna sit laboris aliquip irure sunt. Ut minim dolor
          proident ex. Amet do enim id quis aliquip pariatur labore mollit enim
          excepteur. Aliquip cillum enim eu commodo duis commodo nisi
          adipisicing ex dolore ad. Officia aute labore aute minim sint ad
          officia dolor. Minim tempor quis do deserunt exercitation. Lorem
          officia nisi cillum sint quis. Nostrud esse aute excepteur aute
          voluptate eu mollit irure magna sunt veniam officia aliquip. Labore
          fugiat occaecat esse est ex et occaecat. Mollit deserunt ullamco eu
          adipisicing sint tempor ex incididunt. Aute adipisicing sit fugiat ea.
          Qui duis sunt dolore reprehenderit enim dolor irure sit sit dolor
          laboris id magna culpa. Velit minim proident amet aliquip eu.
        </div>
      </div>
    </>
  )
}

export default StudyDetails
