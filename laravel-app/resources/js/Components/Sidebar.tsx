import React from "react";
import { Link } from "@inertiajs/react";
import * as MT from "@material-tailwind/react";
const MTCard = MT.Card as unknown as React.FC<any>;
const MTList = MT.List as unknown as React.FC<any>;
const MTListItem = MT.ListItem as unknown as React.FC<any>;
const MTListItemPrefix = MT.ListItemPrefix as unknown as React.FC<any>;
const MTAccordion = MT.Accordion as unknown as React.FC<any>;
const MTAccordionHeader = MT.AccordionHeader as unknown as React.FC<any>;
const MTAccordionBody = MT.AccordionBody as unknown as React.FC<any>;
const MTTypography = MT.Typography as unknown as React.FC<any>;

import {
  ChevronDownIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  RectangleGroupIcon,
  UserIcon,
  PhotoIcon,
  FolderIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

export default function Sidebar() {
  const [open, setOpen] = React.useState<number>(0);

  const handleOpen = (value: number) => {
    setOpen(open === value ? 0 : value);
  };

  const LIST_ITEM_STYLES =
    "select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900";

  return (
    <MTCard className="h-[calc(100vh-2rem)] w-full max-w-[18rem] mx-auto p-6 shadow-md border-r border-gray-200">
      {/* --- Brand/Header --- */}
      <div className="mb-4 flex items-center gap-3 p-2">
        <img src="/images/logo.png" alt="brand" className="h-9 w-9 object-contain" />
        <MTTypography color="blue-gray" className="text-lg font-semibold">
          TDC Admin
        </MTTypography>
      </div>

      <hr className="my-2 border-gray-200" />

      {/* --- Navigation --- */}
      <MTList>
        <MTListItem className={LIST_ITEM_STYLES}>
          <MTListItemPrefix>
            <RectangleGroupIcon className="h-5 w-5" />
          </MTListItemPrefix>
          <Link
            href={route("dashboard")}
            className={`w-full ${route().current("dashboard") ? "text-gray-900 font-medium" : "text-gray-600"}`}
          >
            Dashboard
          </Link>
        </MTListItem>

        <MTAccordion open={open === 1}>
          <MTAccordionHeader
            onClick={() => handleOpen(1)}
            className="px-3 py-2 cursor-pointer text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center w-full">
              <MTListItemPrefix>
                <DocumentTextIcon className="h-5 w-5" />
              </MTListItemPrefix>
              <MTTypography className="mr-auto font-normal text-inherit">
                Posts
              </MTTypography>
              <ChevronDownIcon
                strokeWidth={3}
                className={`ml-auto h-4 w-4 text-gray-500 transition-transform ${open === 1 ? "rotate-180" : ""}`}
              />
            </div>
          </MTAccordionHeader>
          <MTAccordionBody className="py-1">
            <MTList className="p-0">
              <MTListItem className={`pl-10 ${LIST_ITEM_STYLES}`}>
                <Link
                  href={route("admin.posts.index")}
                  className={`w-full ${route().current("admin.posts.*") ? "text-gray-900 font-medium" : "text-gray-600"}`}
                >
                  All Posts
                </Link>
              </MTListItem>
            </MTList>
          </MTAccordionBody>
        </MTAccordion>

        <MTListItem className={LIST_ITEM_STYLES}>
          <MTListItemPrefix>
            <PhotoIcon className="h-5 w-5" />
          </MTListItemPrefix>
          <Link
            href={route("admin.gallery.index")}
            className={`w-full ${route().current("admin.gallery.*") ? "text-gray-900 font-medium" : "text-gray-600"}`}
          >
            Gallery
          </Link>
        </MTListItem>

        <MTListItem className={LIST_ITEM_STYLES}>
          <MTListItemPrefix>
            <FolderIcon className="h-5 w-5" />
          </MTListItemPrefix>
          <Link
            href={route("admin.projects.index")}
            className={`w-full ${route().current("admin.projects.*") ? "text-gray-900 font-medium" : "text-gray-600"}`}
          >
            Projects
          </Link>
        </MTListItem>
      </MTList>

      <hr className="my-3 border-gray-200" />

      {/* Porfile */}
      <MTListItem className={LIST_ITEM_STYLES}>
        <MTListItemPrefix>
          <UserIcon className="h-5 w-5" />
        </MTListItemPrefix>
        <Link
          href={route("profile.edit")}
          className={`w-full ${route().current("profile.edit") ? "text-gray-900 font-medium" : "text-gray-600"}`}
        >
          Profile
        </Link>
      </MTListItem>

      {/* --- Sign Out --- */}
      <MTList>
        <MTListItem className={LIST_ITEM_STYLES}>
          <MTListItemPrefix>
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
          </MTListItemPrefix>
          <Link href={route("logout")} method="post" as="button" className="text-gray-600 w-full text-left">
            Sign Out
          </Link>
        </MTListItem>
      </MTList>
    </MTCard>
  );
}