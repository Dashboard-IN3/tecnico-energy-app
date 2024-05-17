import crypto from "crypto"
import fs from "fs"

export async function getChecksum(filePath): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256")
    const stream = fs.createReadStream(filePath)

    stream.on("data", chunk => {
      hash.update(chunk)
    })

    stream.on("end", () => {
      resolve(hash.digest("hex"))
    })

    stream.on("error", err => {
      reject(err)
    })
  })
}
