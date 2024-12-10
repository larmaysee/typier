import Link from "next/link";
import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="text-center border-t p-4 h-14 bottom-0">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()}{" "}
        <Link href="https://lisu.io"> lisu.io </Link>. All rights reserved.
      </p>
    </footer>
  );
};

export default SiteFooter;
