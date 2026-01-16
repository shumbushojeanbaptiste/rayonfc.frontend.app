import { Link } from 'react-router-dom';
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-2  text-center   sm:items-center sm:justify-between">
      <h2 className="text-title-sm items-center font-semibold text-green-950 dark:text-white">
        {pageName}
      </h2>
</div>
  );
};

export default Breadcrumb;
