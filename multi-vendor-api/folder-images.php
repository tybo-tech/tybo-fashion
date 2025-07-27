<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uploads</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            padding: 20px;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        }

        .grid-item {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }

        .grid-item:hover {
            transform: translateY(-5px);
        }

        .grid-item img,
        .grid-item video {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 8px 8px 0 0;
        }

        .grid-item button {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #bfbfbf;
            color: dimgray;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 4px;
            transition: 0.2s ease-in-out;
        }

        .grid-item button:hover {
            background-color: black;
            color: white;
        }
    </style>
</head>

<body>

    <div class="grid-container">
        <?php
        $dir = __DIR__;
        $files = array_diff(scandir($dir), array('.', '..', 'index.php'));

        $fileDetails = [];

        foreach ($files as $file) {
            $filePath = $dir . DIRECTORY_SEPARATOR . $file;
            $fileDetails[] = [
                'name' => $file,
                'path' => $filePath,
                'modified' => filemtime($filePath)
            ];
        }

        usort($fileDetails, function ($a, $b) {
            return $b['modified'] - $a['modified'];
        });

        foreach ($fileDetails as $fileDetail) {
            $file = $fileDetail['name'];
            $filePath = $fileDetail['path'];
            $fileInfo = pathinfo($filePath);
            $fileExtension = strtolower($fileInfo['extension']);

            if (in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                echo '<div class="grid-item">';
                echo "<img src=\"$file\" alt=\"$file\">";
                echo "<button onclick=\"confirmDelete('$file')\">Delete</button>";
                echo '</div>';
            } elseif (in_array($fileExtension, ['mp4', 'webm', 'ogg'])) {
                echo '<div class="grid-item">';
                echo "<video controls><source src=\"$file\" type=\"video/$fileExtension\"></video>";
                echo "<button onclick=\"confirmDelete('$file')\">Delete</button>";
                echo '</div>';
            }

        }
        ?>
    </div>

    <script>
        function confirmDelete(fileName) {
            if (confirm("Are you sure you want to delete " + fileName + "?")) {
                window.location.href = 'index.php?delete=' + fileName;
            }
        }
    </script>

    <?php
    if (isset($_GET['delete'])) {
        $fileToDelete = $_GET['delete'];
        $filePathToDelete = $dir . DIRECTORY_SEPARATOR . $fileToDelete;

        if (file_exists($filePathToDelete)) {
            unlink($filePathToDelete);
            header("Location: index.php");
            exit();
        } else {
            echo "<script>alert('File not found.');</script>";
        }
    }
    ?>

</body>

</html>