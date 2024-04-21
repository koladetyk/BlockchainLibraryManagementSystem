// scripts/deploy.js

async function main() {
  
    const LibraryFactory = await ethers.getContractFactory("Library");
    const library = await LibraryFactory.deploy();
    await library.deployed();
  
    console.log("Library contract deployed to:", library.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  