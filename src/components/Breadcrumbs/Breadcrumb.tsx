
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-2  text-center   sm:items-center sm:justify-between">
      <h2 className="text-title-xsm items-center font-normal text-green-950 dark:text-slate-300">
        {pageName}
      </h2>
</div>
  ); 
};

export default Breadcrumb;
