import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = (props: Props) => {
  return <div>{props.children}</div>;
};

export default Layout;
