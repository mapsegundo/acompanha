type SignedUrlResponse = {
  signedUrl: string | null
}

type SignedUrlClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrls: (
        paths: string[],
        expiresIn: number
      ) => Promise<{ data: SignedUrlResponse[] | null; error: unknown }>
    }
  }
}

type WithPhotoPath = {
  foto_url: string | null
}

export type WithSignedUrl<T extends WithPhotoPath> = T & {
  signedUrl: string | null
}

export async function withSignedMeasurementUrls<T extends WithPhotoPath>(
  client: SignedUrlClient,
  rows: T[],
  expiresIn = 3600
): Promise<WithSignedUrl<T>[]> {
  if (rows.length === 0) {
    return []
  }

  const uniquePaths = Array.from(
    new Set(rows.map((row) => row.foto_url).filter((path): path is string => Boolean(path)))
  )

  if (uniquePaths.length === 0) {
    return rows.map((row) => ({ ...row, signedUrl: null }))
  }

  const { data, error } = await client.storage.from("measurements").createSignedUrls(uniquePaths, expiresIn)
  const signedUrlByPath = new Map<string, string>()

  if (!error && data) {
    data.forEach((item, index) => {
      const path = uniquePaths[index]
      if (path && item?.signedUrl) {
        signedUrlByPath.set(path, item.signedUrl)
      }
    })
  }

  return rows.map((row) => ({
    ...row,
    signedUrl: row.foto_url ? signedUrlByPath.get(row.foto_url) ?? null : null,
  }))
}
