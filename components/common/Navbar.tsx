/* eslint-disable @next/next/no-img-element */
import {
  Sheet,
  SheetClose,
  SheetTitle,
  SheetContent,
} from "@/components/ui/Sheet";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Button, Dropdown } from "../common";
import { ArrowUpRight, BurgerMenu, Close } from "@/icons";

import ConnectButton from "./ConnectButton";

const Navbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    {
      name: "My dashboard",
      href: "/",
    },
    {
      name: "Create an Invoice",
      href: "/create-invoice",
    },
    {
      name: "Events Community",
      href: "/events",
    },
    {
      name: "Admin",
      href: "/admin",
    },
  ];

  const supportLinks = [
    {
      name: "Github Discussions",
      href: "https://github.com/orgs/RequestNetwork/discussions",
    },
    {
      name: "Discord",
      href: "https://discord.com/channels/468974345222619136/1103420140181274645",
    },
  ];

  return (
    <nav className="relative h-full flex items-center p-[20px] gap-[20px] xl:gap-[60px] bg-white shadow-small mb-[30px] tablet:mb-[80px]">
      {/* <a
        target="_blank"
        rel="noreferrer noopener"
        href="https://request.network/"
        className="mr-auto tablet:mr-0"
      >
        <img
          src="assets/logo.svg"
          alt="Request Network Logo"
          className="w-[100px] xl:w-[120px]"
        />
      </a> */}
      <BurgerMenu
        className="block tablet:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      />
      <ul className="hidden tablet:flex  h-full gap-[20px] xl:gap-[60px] text-[14px] lg:text-[16px]">
        {links.map((link, index) => (
          <li className={`h-full relative text-black`} key={index}>
            <Link href={link.href}>{link.name}</Link>
            <div
              className={`${
                router.pathname === link.href &&
                "h-[4px] bg-green w-full absolute bottom-[-28px]"
              }`}
            ></div>
          </li>
        ))}
      </ul>
      <div className="hidden tablet:flex items-center gap-[16px] ml-auto ">
        {/* <Dropdown title="Need help?" items={supportLinks} />
        <a
          target="_blank"
          rel="noreferrer noopener"
          href="https://docs.request.network/building-blocks/templates"
          className="flex items-center gap-[6px] bg-transparent text-green font-medium text-[14px] hover:text-dark-green"
        >
          Integrate in your app
          <ArrowUpRight />
        </a> */}
        <ConnectButton />
        {/* <Button
          text="Book a demo"
          href={process.env.NEXT_PUBLIC_DEMO_URL}
          anchorProps={{ target: "_blank", rel: "noreferrer noopener" }}
        /> */}
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent>
          <SheetTitle hidden>Menu</SheetTitle>
          <SheetClose className="absolute right-5 top-5">
            <Close />
          </SheetClose>
          {/* <ul className="flex flex-col gap-7 text-[16px] w-full">
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  className={`w-[80%] block h-[30px] ${
                    router.pathname === link.href &&
                    "border-b-[1px] border-solid border-green"
                  }`}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <Dropdown title="Need help?" items={supportLinks} />
            </li>
            <li>
              <a
                target="_blank"
                rel="noreferrer noopener"
                href="https://docs.request.network/building-blocks/templates"
                className="flex items-center gap-[6px] bg-transparent text-green font-medium text-[14px] hover:text-dark-green"
              >
                Integrate in your app
                <ArrowUpRight />
              </a>
            </li>
            <li>
              <ConnectButton />
            </li>
            <li>
              <Button
                text="Book a demo"
                href={process.env.NEXT_PUBLIC_DEMO_URL}
              />
            </li>
          </ul> */}
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
