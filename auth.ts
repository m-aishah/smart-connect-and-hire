import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { client } from "./sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanity/lib/queries";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, account, profile }) {
      const existingUser = await client.fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
        id: profile?.id,
      });

      console.log({ existingUser, profile, user });

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          id: profile?.id,
          name: user?.name,
          username: profile?.login,
          email: user?.email,
          image: user?.image,
          bio: profile?.bio || "",
        });
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client.fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
          id: profile?.id,
        });

        token.id = user._id;
      }
      return token;
    },

    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
