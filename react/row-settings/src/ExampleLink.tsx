export const ExampleLink = ({ icon, label, url }) => {
  const Icon = icon;
  return (
    <a className="example--link" href={url} target="_blank">
      {icon && <Icon className="example--link__icon" />}
      {label}
    </a>
  );
};
